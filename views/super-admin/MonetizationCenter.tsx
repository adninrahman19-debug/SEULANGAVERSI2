
import React, { useState, useMemo } from 'react';
import { Transaction, Business, SubscriptionPlan, SystemModule, BusinessCategory } from '../../types';
import { MOCK_TRANSACTIONS, MOCK_BUSINESSES } from '../../constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

interface MonetizationCenterProps {
  transactions: Transaction[];
  businesses: Business[];
}

export const MonetizationCenter: React.FC<MonetizationCenterProps> = ({ transactions, businesses }) => {
  // 1. GLOBAL MONETIZATION SETTINGS
  const [globalCommission, setGlobalCommission] = useState(10);
  const [featuredListingPrice, setFeaturedListingPrice] = useState(250000);
  
  // 2. SUBSCRIPTION CONFIGURATION
  const [plans, setPlans] = useState([
    { id: SubscriptionPlan.BASIC, price: 0, commission: 15, unitLimit: 10, featured: 'None' },
    { id: SubscriptionPlan.PRO, price: 499000, commission: 10, unitLimit: 50, featured: 'Standard' },
    { id: SubscriptionPlan.PREMIUM, price: 1200000, commission: 5, unitLimit: 999, featured: 'Priority' },
  ]);

  // 3. REVENUE CALCULATIONS
  const stats = useMemo(() => {
    const totalGTV = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const platformComm = transactions.filter(t => t.type === 'commission').reduce((sum, tx) => sum + tx.amount, 0);
    const subRevenue = transactions.filter(t => t.type === 'subscription').reduce((sum, tx) => sum + tx.amount, 0);
    const adRevenue = transactions.filter(t => t.type === 'ad_promotion').reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      totalRevenue: platformComm + subRevenue + adRevenue,
      platformComm,
      subRevenue,
      adRevenue,
      gtv: totalGTV
    };
  }, [transactions]);

  const revenueByDay = [
    { name: 'Mon', total: 4200000, subs: 1200000, comm: 3000000 },
    { name: 'Tue', total: 3800000, subs: 0, comm: 3800000 },
    { name: 'Wed', total: 5100000, subs: 1200000, comm: 3900000 },
    { name: 'Thu', total: 4600000, subs: 499000, comm: 4101000 },
    { name: 'Fri', total: 7200000, subs: 2400000, comm: 4800000 },
    { name: 'Sat', total: 9500000, subs: 1200000, comm: 8300000 },
    { name: 'Sun', total: 8400000, subs: 0, comm: 8400000 },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TREASURY OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Platform Net Earnings', value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: 'fa-vault', color: 'bg-indigo-600 text-white', trend: '+15%' },
          { label: 'Subscription Node', value: `Rp ${(stats.subRevenue / 1000000).toFixed(1)}M`, icon: 'fa-gem', color: 'bg-white text-slate-900', trend: '+8%' },
          { label: 'Commission Hub', value: `Rp ${(stats.platformComm / 1000000).toFixed(1)}M`, icon: 'fa-percentage', color: 'bg-white text-slate-900', trend: '+22%' },
          { label: 'Marketplace Ads', value: `Rp ${(stats.adRevenue / 1000).toFixed(0)}K`, icon: 'fa-fire-flame-curved', color: 'bg-white text-slate-900', trend: '+5%' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all`}>
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

      {/* 2. REVENUE PULSE CHART */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Revenue Pulse Node</h3>
               <p className="text-slate-400 text-sm font-medium">Daily platform earnings from commissions and subscription settlements.</p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
               <button className="px-6 py-2.5 bg-white text-indigo-600 shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest">7 Days Trace</button>
               <button className="px-6 py-2.5 text-slate-400 text-[10px] font-black uppercase tracking-widest">30 Days Trace</button>
            </div>
         </div>
         <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={revenueByDay}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" name="Total Platform Income" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         {/* 3. SUBSCRIPTION GOVERNANCE */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
               <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-8">
                  <div>
                     <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">Subscription Policy Engine</h3>
                     <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest mt-2">Modify tier pricing and capability constraints</p>
                  </div>
                  <i className="fas fa-microchip text-indigo-400 text-2xl"></i>
               </div>

               <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((p, idx) => (
                    <div key={p.id} className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6 group hover:bg-white/10 transition-all">
                       <div className="flex justify-between items-center">
                          <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${idx === 2 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>{p.id}</span>
                          <i className="fas fa-pen text-[10px] text-white/20 group-hover:text-indigo-400 cursor-pointer"></i>
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Monthly Price</p>
                          <div className="flex items-baseline gap-1">
                             <span className="text-xs font-bold opacity-30">Rp</span>
                             <h4 className="text-3xl font-black tracking-tighter">{(p.price/1000).toFixed(0)}<span className="text-lg opacity-40">K</span></h4>
                          </div>
                       </div>
                       <div className="space-y-3 pt-4 border-t border-white/5">
                          <div className="flex justify-between text-[9px] font-black uppercase">
                             <span className="text-white/40">Comm Rate:</span>
                             <span className="text-indigo-400">{p.commission}%</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-black uppercase">
                             <span className="text-white/40">Unit Quota:</span>
                             <span className="text-indigo-400">{p.unitLimit} Nodes</span>
                          </div>
                          <div className="flex justify-between text-[9px] font-black uppercase">
                             <span className="text-white/40">Search Rank:</span>
                             <span className="text-indigo-400">{p.featured}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-400 hover:text-white transition-all">
                  Authorize Global Policy Update
               </button>
            </div>

            {/* FEATURE-BASED PRICING */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
               <h3 className="text-xl font-black text-slate-900 uppercase">Premium Add-On Matrix</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'AI Business Intelligence', price: '99K/mo', icon: 'fa-brain-circuit' },
                    { name: 'Custom Domain Node', price: '149K/yr', icon: 'fa-globe' },
                    { name: 'Staff Expansion (+10)', price: '199K/mo', icon: 'fa-users-plus' },
                    { name: 'White Label Protocol', price: '499K/mo', icon: 'fa-fingerprint' },
                  ].map(feature => (
                    <div key={feature.name} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                             <i className={`fas ${feature.icon}`}></i>
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-900 uppercase">{feature.name}</p>
                             <p className="text-[10px] font-bold text-indigo-600">Rp {feature.price}</p>
                          </div>
                       </div>
                       <i className="fas fa-chevron-right text-slate-300 text-xs"></i>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 4. MONETIZATION CONTROLS SIDEBAR */}
         <div className="space-y-8">
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
               <h3 className="text-xl font-black text-slate-900 uppercase">Monetization Hub</h3>
               
               {/* Commission Control */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Commission (%)</p>
                     <span className="text-sm font-black text-indigo-600">{globalCommission}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="30" value={globalCommission} 
                    onChange={(e) => setGlobalCommission(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <p className="text-[9px] font-bold text-slate-400 italic">Effective on all Standard/Basic tier transactions.</p>
               </div>

               {/* Featured Listing Control */}
               <div className="space-y-4 pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Boost Price</p>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">Rp</span>
                     <input 
                       type="number" 
                       value={featuredListingPrice}
                       onChange={(e) => setFeaturedListingPrice(parseInt(e.target.value))}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-black text-slate-700 focus:ring-4 ring-indigo-50 outline-none"
                     />
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 italic">Per 30-day billing cycle for standard entities.</p>
               </div>

               <button className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                  Commit System Changes
               </button>
            </div>

            {/* PAYOUT MONITORING */}
            <div className="bg-indigo-600 p-10 rounded-[48px] shadow-xl text-white space-y-8 relative overflow-hidden">
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                     <i className="fas fa-hand-holding-dollar"></i>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight">Owner Payouts</h4>
               </div>
               <div className="space-y-4">
                  {[
                    { name: 'Grand Seulanga', amount: '12.4M', status: 'Pending' },
                    { name: 'Pine Hill Guest', amount: '4.2M', status: 'Cleared' },
                  ].map((payout, i) => (
                    <div key={i} className="p-4 bg-white/10 border border-white/5 rounded-2xl flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black uppercase leading-none mb-1">{payout.name}</p>
                          <p className="text-xs font-black text-indigo-200">Rp {payout.amount}</p>
                       </div>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${payout.status === 'Cleared' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{payout.status}</span>
                    </div>
                  ))}
               </div>
               <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">Manage Treasury →</button>
            </div>
         </div>
      </div>
    </div>
  );
};
