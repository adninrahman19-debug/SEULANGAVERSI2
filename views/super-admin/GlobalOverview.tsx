
import React, { useMemo } from 'react';
import { Business, User, Transaction, SecurityIncident } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Cell, PieChart, Pie
} from 'recharts';

interface GlobalOverviewProps {
  businesses: Business[];
  users: User[];
  transactions: Transaction[];
  platformTrendData: any[];
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({ businesses, users, transactions, platformTrendData }) => {
  // Mock System Status
  const systemStatus = {
    server: 'Operational',
    latency: '1.2ms',
    queue: 0,
    errors: 0,
    uptime: '99.99%'
  };

  const incidents: SecurityIncident[] = [
    { id: 'inc-1', type: 'anomaly', severity: 'medium', status: 'investigating', description: 'Unusual GTV spike detected in Node-B12', createdAt: '2024-12-28 14:20' }
  ];

  // Aggregated Data
  const totalGTV = useMemo(() => transactions.reduce((acc, curr) => acc + curr.amount, 0), [transactions]);
  const seulangaCommission = useMemo(() => 
    transactions.filter(t => t.type === 'commission').reduce((acc, curr) => acc + curr.amount, 0), 
    [transactions]
  );

  const businessStats = {
    active: businesses.filter(b => b.status === 'active').length,
    pending: businesses.filter(b => b.status === 'pending').length,
    suspended: businesses.filter(b => b.status === 'suspended').length
  };

  const userStats = {
    owners: users.filter(u => u.role === 'BUSINESS_OWNER').length,
    staff: users.filter(u => u.role === 'ADMIN_STAFF').length,
    guests: users.filter(u => u.role === 'GUEST').length
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TOP-TIER METRICS: REVENUE & MONETIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group border border-white/5">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all"></div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Gross Transaction Value (GTV)</p>
              <h3 className="text-3xl font-black tracking-tighter">Rp {(totalGTV / 1000000).toFixed(1)}M</h3>
              <div className="mt-4 flex items-center gap-2">
                 <i className="fas fa-chart-line text-emerald-400 text-xs"></i>
                 <span className="text-[9px] font-bold text-emerald-400 uppercase">+12.4% vs LMT</span>
              </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seulanga Commission</p>
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><i className="fas fa-coins text-xs"></i></div>
           </div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Rp {(seulangaCommission / 1000000).toFixed(1)}M</h3>
           <p className="mt-4 text-[9px] font-black text-indigo-600 uppercase tracking-widest">Net Revenue Node</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Scale</p>
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i className="fas fa-sitemap text-xs"></i></div>
           </div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{businesses.length} Total Nodes</h3>
           <p className="mt-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest">{businessStats.active} Operational</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
           <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ecosystem Identity</p>
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><i className="fas fa-users-gear text-xs"></i></div>
           </div>
           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{users.length} Identities</h3>
           <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{userStats.guests} Verified Guests</p>
        </div>
      </div>

      {/* 2. INFRASTRUCTURE & TRENDS */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Trend Analysis */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Platform Monetization Trend</h3>
                 <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">GTV & Commission Cycle (Weekly View)</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                 <button className="px-4 py-2 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase text-indigo-600">Overview</button>
                 <button className="px-4 py-2 text-[10px] font-black uppercase text-slate-400">Deep Audit</button>
              </div>
           </div>
           <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={platformTrendData}>
                    <defs>
                       <linearGradient id="gtvGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="revenue" fill="url(#gtvGrad)" stroke="#4f46e5" strokeWidth={3} name="Total GTV" />
                    <Line type="monotone" dataKey="commission" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} name="Platform Net" />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* System Health Monitor */}
        <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl text-white space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[80px]"></div>
           <div className="relative z-10 flex items-center gap-4 border-b border-white/5 pb-8">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                 <i className="fas fa-microchip"></i>
              </div>
              <div>
                <h4 className="text-lg font-black tracking-tight uppercase">System Health</h4>
                <p className="text-emerald-400/60 text-[9px] font-black uppercase tracking-widest">Real-time Alpha Node</p>
              </div>
           </div>

           <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Platform Core</span>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase border border-emerald-500/30">Stable</span>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">API Latency</p>
                    <p className="text-2xl font-black text-white tracking-tighter">{systemStatus.latency}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Queue Status</p>
                    <p className="text-2xl font-black text-white tracking-tighter">{systemStatus.queue} Jobs</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Uptime Index</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tighter">{systemStatus.uptime}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">System Errors</p>
                    <p className="text-2xl font-black text-rose-500 tracking-tighter">{systemStatus.errors}</p>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                 <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                    <i className="fas fa-terminal"></i> Buka Terminal Infrastruktur
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* 3. BUSINESS & USER DISTRIBUTION */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
            <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Ecosystem Topology</h4>
            <div className="space-y-6">
               <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">Active Businesses</span>
                  <span className="text-emerald-600">{businessStats.active} Nodes</span>
               </div>
               <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${(businessStats.active / businesses.length) * 100}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">Pending Review</span>
                  <span className="text-amber-600">{businessStats.pending} Nodes</span>
               </div>
               <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${(businessStats.pending / businesses.length) * 100}%` }}></div>
               </div>
               <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">Suspended</span>
                  <span className="text-rose-600">{businessStats.suspended} Nodes</span>
               </div>
               <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${(businessStats.suspended / businesses.length) * 100}%` }}></div>
               </div>
            </div>
         </div>

         <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8 flex flex-col justify-between">
            <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Role Concentration</h4>
            <div className="h-48">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={[
                           { name: 'Owners', value: userStats.owners },
                           { name: 'Staff', value: userStats.staff },
                           { name: 'Guests', value: userStats.guests },
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        <Cell fill="#4f46e5" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2">
               <div className="text-center">
                  <p className="text-lg font-black text-slate-900 leading-none">{userStats.owners}</p>
                  <p className="text-[8px] font-black text-indigo-600 uppercase mt-1">Owners</p>
               </div>
               <div className="text-center border-x border-slate-50">
                  <p className="text-lg font-black text-slate-900 leading-none">{userStats.staff}</p>
                  <p className="text-[8px] font-black text-emerald-600 uppercase mt-1">Staff</p>
               </div>
               <div className="text-center">
                  <p className="text-lg font-black text-slate-900 leading-none">{userStats.guests}</p>
                  <p className="text-[8px] font-black text-amber-600 uppercase mt-1">Guests</p>
               </div>
            </div>
         </div>

         {/* Security Feed (Strategic Level) */}
         <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
               <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Governance Alert</h4>
               <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            </div>
            <div className="space-y-4">
               {incidents.map(inc => (
                  <div key={inc.id} className="p-5 bg-rose-50 border border-rose-100 rounded-[28px] space-y-3 group hover:bg-rose-100/50 transition-all cursor-pointer">
                     <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest">{inc.severity} RISK</span>
                        <span className="text-[9px] font-bold text-rose-400 uppercase">{inc.createdAt}</span>
                     </div>
                     <p className="text-xs font-bold text-rose-900 leading-relaxed">{inc.description}</p>
                     <button className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline">Investigate Node →</button>
                  </div>
               ))}
               <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">Lihat Semua Log Keamanan</button>
            </div>
         </div>
      </div>
    </div>
  );
};
