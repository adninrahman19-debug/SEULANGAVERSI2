
import React, { useState, useMemo } from 'react';
import { Business, User, Transaction, BusinessCategory } from '../../types';
import { MOCK_BUSINESSES, MOCK_USERS, MOCK_TRANSACTIONS } from '../../constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

interface PlatformAnalyticsProps {
  businesses: Business[];
  users: User[];
  transactions: Transaction[];
}

export const PlatformAnalytics: React.FC<PlatformAnalyticsProps> = ({ businesses, users, transactions }) => {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '1Y'>('30D');

  // 1. DATA TRANSFORMATIONS
  const revenueTrend = [
    { name: 'Jan', commission: 45000000, sub: 12000000, total: 57000000 },
    { name: 'Feb', commission: 52000000, sub: 15000000, total: 67000000 },
    { name: 'Mar', commission: 48000000, sub: 15000000, total: 63000000 },
    { name: 'Apr', commission: 61000000, sub: 18000000, total: 79000000 },
    { name: 'May', commission: 55000000, sub: 22000000, total: 77000000 },
    { name: 'Jun', commission: 85000000, sub: 25000000, total: 110000000 },
  ];

  const userGrowth = [
    { name: 'Week 1', guests: 1200, owners: 45 },
    { name: 'Week 2', guests: 1850, owners: 52 },
    { name: 'Week 3', guests: 2400, owners: 58 },
    { name: 'Week 4', guests: 3100, owners: 65 },
  ];

  const categoryPerformance = [
    { name: 'Hotel', value: 45 },
    { name: 'Homestay', value: 25 },
    { name: 'Kost', value: 20 },
    { name: 'Rentals', value: 10 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'];

  // 2. STATS CALCULATION
  const stats = useMemo(() => {
    const totalGTV = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalRevenue = transactions.filter(t => t.type === 'commission' || t.type === 'subscription').reduce((sum, tx) => sum + tx.amount, 0);
    return {
      totalGTV,
      totalRevenue,
      arpu: totalRevenue / (users.filter(u => u.role === 'BUSINESS_OWNER').length || 1),
      retention: 94.2
    };
  }, [transactions, users]);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. STRATEGIC SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Global Revenue Cycle', value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: 'fa-vault', trend: '+18%', color: 'bg-indigo-600 text-white' },
          { label: 'Marketplace Velocity (GTV)', value: `Rp ${(stats.totalGTV / 1000000).toFixed(1)}M`, icon: 'fa-chart-line-up', trend: '+22%', color: 'bg-white text-slate-900' },
          { label: 'ARPU (Owner Node)', value: `Rp ${(stats.arpu / 1000).toFixed(0)}K`, icon: 'fa-user-tag', trend: '+5%', color: 'bg-white text-slate-900' },
          { label: 'SLA Retention', value: `${stats.retention}%`, icon: 'fa-handshake-angle', trend: 'Stable', color: 'bg-white text-slate-900' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group`}>
             <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color.includes('white') ? 'bg-slate-50 border-slate-100 text-indigo-600' : 'bg-white/10 border-white/10 text-white'}`}>
                   <i className={`fas ${stat.icon}`}></i>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${stat.color.includes('white') ? 'bg-emerald-50 text-emerald-600' : 'bg-white/20 text-white'}`}>{stat.trend}</span>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
             <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* 2. REVENUE TREND ARCHITECTURE */}
         <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Financial Trajectory</h3>
                  <p className="text-slate-400 text-sm font-medium">Monthly revenue split between platform commissions and subscription tiers.</p>
               </div>
               <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  {['7D', '30D', '1Y'].map(t => (
                    <button key={t} onClick={() => setTimeframe(t as any)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t}</button>
                  ))}
               </div>
            </div>
            
            <div className="h-[450px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                     <defs>
                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                     <Tooltip contentStyle={{borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.12)', padding: '24px'}} />
                     <Area type="monotone" dataKey="commission" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorComm)" name="Commissions" />
                     <Area type="monotone" dataKey="sub" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorSub)" name="Subscriptions" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 3. PERFORMANCE LEADERBOARD */}
         <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <h3 className="text-xl font-black tracking-tight uppercase mb-2 leading-none italic">Top Performers</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest mb-10">Ranking by Gross Marketplace Contribution</p>
               
               <div className="space-y-6">
                  {businesses.slice(0, 5).map((biz, i) => (
                    <div key={biz.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all flex items-center justify-between">
                       <div className="flex items-center gap-5">
                          <span className="text-xs font-black text-indigo-400">#{i + 1}</span>
                          <div>
                             <p className="text-xs font-black uppercase text-indigo-50">{biz.name}</p>
                             <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{biz.category}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-emerald-400">Rp 12.4M</p>
                          <p className="text-[8px] font-black text-white/10 uppercase">GTV Weight</p>
                       </div>
                    </div>
                  ))}
               </div>
               
               <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Audit Full Business Index</button>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* 4. USER GROWTH PULSE */}
         <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <h3 className="text-xl font-black text-slate-900 uppercase">Population Growth</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowth}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                     <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none'}} />
                     <Bar dataKey="guests" fill="#4f46e5" radius={[10, 10, 0, 0]} name="New Guests" />
                     <Bar dataKey="owners" fill="#f59e0b" radius={[10, 10, 0, 0]} name="New Owners" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 5. TOPOLOGY DISTRIBUTION */}
         <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10 flex flex-col items-center justify-center">
            <h3 className="text-xl font-black text-slate-900 uppercase text-center">Topology weight</h3>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={categoryPerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {categoryPerformance.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* 6. SOVEREIGN EXPORT TERMINAL */}
         <div className="bg-indigo-600 p-12 rounded-[56px] shadow-2xl text-white space-y-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 mb-8 shadow-inner">
                  <i className="fas fa-file-export text-2xl"></i>
               </div>
               <h3 className="text-2xl font-black tracking-tight uppercase leading-tight">Master Report Node</h3>
               <p className="text-indigo-100/60 font-medium text-sm leading-relaxed mt-4">Generate comprehensive cryptographic audit threads for the entire ecosystem.</p>
            </div>
            
            <div className="space-y-3 relative z-10">
               <button onClick={() => alert('Generating Sovereign Excel Thread...')} className="w-full py-5 bg-white text-indigo-600 rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-3">
                  <i className="fas fa-file-excel"></i> Export Strategic Excel
               </button>
               <button onClick={() => alert('Dispatching PDF Audit to sovereign email...')} className="w-full py-5 bg-indigo-500 text-white border border-white/20 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-400 transition-all flex items-center justify-center gap-3">
                  <i className="fas fa-file-pdf"></i> Generate System PDF
               </button>
            </div>
         </div>
      </div>

      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center gap-4">
         <i className="fas fa-microchip text-indigo-400 text-lg animate-pulse"></i>
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">SEULANGA ANALYTICS PROTOCOL v2.4 ACTIVE & SECURE</p>
      </div>
    </div>
  );
};
