
import React, { useState, useMemo } from 'react';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_REVIEWS, TRANSLATIONS, MOCK_BOOKINGS, DEFAULT_CATEGORY_MODULE_MAP } from '../constants';
import { BusinessCategory, SubscriptionPlan, Business, AuditLog, UserRole, BusinessStatus, Review, Transaction, User, VerificationStatus, CategoryModuleConfig, SystemModule, BookingStatus, Booking, SecurityIncident, Unit } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';

interface SuperAdminDashboardProps {
  activeTab: 'overview' | 'analytics' | 'monetization' | 'tenants' | 'reviews' | 'finance' | 'logs' | 'settings' | 'profile' | 'engine' | 'accounts' | 'matrix' | 'oversight' | 'quality' | 'trust' | 'security';
  onNavigate: (view: string, subView?: string) => void;
  language: 'id' | 'en';
  moduleConfigs: CategoryModuleConfig;
  onUpdateModuleConfigs: (configs: CategoryModuleConfig) => void;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

const platformTrendData = [
  { name: 'Mon', bookings: 12, revenue: 18000000, commission: 2160000 },
  { name: 'Tue', bookings: 18, revenue: 24500000, commission: 2940000 },
  { name: 'Wed', bookings: 15, revenue: 19800000, commission: 2376000 },
  { name: 'Thu', bookings: 22, revenue: 32000000, commission: 3840000 },
  { name: 'Fri', bookings: 35, revenue: 48000000, commission: 5760000 },
  { name: 'Sat', bookings: 45, revenue: 62000000, commission: 7440000 },
  { name: 'Sun', bookings: 38, revenue: 55000000, commission: 6600000 },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ 
  activeTab, 
  onNavigate, 
  language,
  moduleConfigs,
  onUpdateModuleConfigs,
  currentUser,
  onUpdateUser
}) => {
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES.map(b => ({
    ...b,
    subscriptionExpiry: '2025-12-31',
    registrationDate: '2024-01-15'
  })));
  
  const [users] = useState<User[]>(MOCK_USERS);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [incidents] = useState<SecurityIncident[]>([
    { id: 'inc-1', type: 'brute_force', severity: 'high', status: 'investigating', description: 'Multiple failed login attempts detected on Admin Node 01.', createdAt: '2024-12-28 10:30' },
  ]);

  // --- FLEX ENGINE STATES ---
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(Object.values(BusinessCategory));
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [planModuleMap, setPlanModuleMap] = useState<Record<SubscriptionPlan, SystemModule[]>>({
    [SubscriptionPlan.BASIC]: [SystemModule.BOOKING, SystemModule.REVIEWS],
    [SubscriptionPlan.PRO]: [SystemModule.BOOKING, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.MARKETING, SystemModule.MONTHLY_RENTAL],
    [SubscriptionPlan.PREMIUM]: Object.values(SystemModule)
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingBizId, setInspectingBizId] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  // --- ENGINE HANDLERS ---
  const handleToggleModuleForCategory = (category: string, module: SystemModule) => {
    const current = moduleConfigs[category] || [];
    const updated = current.includes(module) 
      ? current.filter(m => m !== module)
      : [...current, module];
    onUpdateModuleConfigs({ ...moduleConfigs, [category]: updated });
  };

  const handleToggleModuleForPlan = (plan: SubscriptionPlan, module: SystemModule) => {
    setPlanModuleMap(prev => {
      const current = prev[plan] || [];
      const updated = current.includes(module)
        ? current.filter(m => m !== module)
        : [...current, module];
      return { ...prev, [plan]: updated };
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const name = new FormData(e.currentTarget as HTMLFormElement).get('catName') as string;
    if (dynamicCategories.includes(name)) return alert("Topology already exists.");
    setDynamicCategories([...dynamicCategories, name]);
    onUpdateModuleConfigs({ ...moduleConfigs, [name]: [SystemModule.REVIEWS] });
    setIsAddCatModalOpen(false);
    alert(`New Business Topology Node Created: ${name}`);
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Terminate ${cat} topology? All associated businesses will lose modular access configuration.`)) {
      setDynamicCategories(dynamicCategories.filter(c => c !== cat));
      const newConfigs = { ...moduleConfigs };
      delete newConfigs[cat];
      onUpdateModuleConfigs(newConfigs);
    }
  };

  // --- RENDERERS ---
  const renderEngine = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Flex Engine (Platform Logic)</h2>
             <p className="text-slate-400 text-sm font-medium">Orchestrate platform flexibility: toggle modules per business type and map plan capabilities.</p>
          </div>
          <button 
            onClick={() => setIsAddCatModalOpen(true)}
            className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
          >
            <i className="fas fa-plus"></i> Add New Topology
          </button>
       </div>

       {/* 1. TOPOLOGY & MODULE MATRIX */}
       <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <i className="fas fa-microchip text-xl"></i>
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Business Module Matrix</h3>
          </div>

          <div className="overflow-x-auto rounded-[32px] border border-slate-50">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 min-w-[200px]">Business Type</th>
                      {[SystemModule.BOOKING, SystemModule.MONTHLY_RENTAL, SystemModule.SALES_PURCHASE, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.TEAM].map(m => (
                        <th key={m} className="px-6 py-6 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">{m}</th>
                      ))}
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {dynamicCategories.map(cat => (
                      <tr key={cat} className="group hover:bg-slate-50/30 transition-all">
                         <td className="px-8 py-6 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10">
                            <span className="font-black text-slate-900 uppercase text-xs">{cat}</span>
                         </td>
                         {[SystemModule.BOOKING, SystemModule.MONTHLY_RENTAL, SystemModule.SALES_PURCHASE, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.TEAM].map(m => (
                           <td key={m} className="px-6 py-6 text-center">
                              <button 
                                onClick={() => handleToggleModuleForCategory(cat, m)}
                                className={`w-8 h-8 rounded-xl transition-all flex items-center justify-center mx-auto border ${
                                  moduleConfigs[cat]?.includes(m) 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                    : 'bg-white border-slate-200 text-slate-200 hover:text-slate-400'
                                }`}
                              >
                                 <i className={`fas ${moduleConfigs[cat]?.includes(m) ? 'fa-check' : 'fa-minus'} text-[10px]`}></i>
                              </button>
                           </td>
                         ))}
                         <td className="px-8 py-6 text-right">
                            <button onClick={() => handleDeleteCategory(cat)} className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors">
                               <i className="fas fa-trash-can text-xs"></i>
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase italic">* Penonaktifan modul akan menyembunyikan fitur tersebut dari Dashboard Owner pada kategori terkait.</p>
       </div>

       {/* 2. SUBSCRIPTION PLAN AUTHORIZATION MATRIX */}
       <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-8">
             <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Plan Authorization Matrix</h3>
                <p className="text-indigo-200/40 text-[10px] font-bold uppercase">Define which modules are accessible per subscription tier</p>
             </div>
             <i className="fas fa-gem text-indigo-400 text-2xl"></i>
          </div>

          <div className="relative z-10 overflow-x-auto rounded-3xl border border-white/5 bg-white/5">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-white/5">
                      <th className="px-10 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Plan Node</th>
                      {Object.values(SystemModule).map(m => (
                        <th key={m} className="px-4 py-6 text-[8px] font-black text-white/40 uppercase tracking-[0.2em] text-center">{m}</th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {Object.values(SubscriptionPlan).map(plan => (
                      <tr key={plan} className="hover:bg-white/5 transition-colors">
                         <td className="px-10 py-6">
                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                               plan === SubscriptionPlan.PREMIUM ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                               plan === SubscriptionPlan.PRO ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                               'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }`}>{plan}</span>
                         </td>
                         {Object.values(SystemModule).map(m => (
                           <td key={m} className="px-4 py-6 text-center">
                              <button 
                                onClick={() => handleToggleModuleForPlan(plan, m)}
                                className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center mx-auto ${
                                  planModuleMap[plan]?.includes(m)
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-white/5 border border-white/10 text-white/10 hover:text-white/30'
                                }`}
                              >
                                 <i className={`fas ${planModuleMap[plan]?.includes(m) ? 'fa-check' : 'fa-lock'} text-[8px]`}></i>
                              </button>
                           </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       {/* ADD TOPOLOGY MODAL */}
       {isAddCatModalOpen && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[48px] p-12 space-y-10 shadow-2xl relative">
               <button onClick={() => setIsAddCatModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">New Topology</h3>
                  <p className="text-slate-400 text-sm font-medium">Create a new business category node.</p>
               </div>
               <form onSubmit={handleAddCategory} className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topology Identity Name</label>
                     <input name="catName" required placeholder="e.g. Co-Working Space" className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 px-6 text-sm font-bold focus:ring-4 ring-indigo-50 outline-none" />
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Authorize Topology</button>
               </form>
            </div>
         </div>
       )}
    </div>
  );

  // --- OTHER RENDERERS PRESERVED ---
  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Business Topology</h3>
                <i className="fas fa-layer-group text-indigo-200"></i>
             </div>
             <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Nodes</p>
                   <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{businesses.filter(b => b.status === 'active').length}</h4>
                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[80%]"></div>
                   </div>
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
                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Owners</p><h4 className="text-4xl font-black text-slate-900">{users.filter(u => u.role === UserRole.BUSINESS_OWNER).length}</h4></div>
                <div className="border-x border-slate-50 px-6"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Staff</p><h4 className="text-4xl font-black text-slate-900">{users.filter(u => u.role === UserRole.ADMIN_STAFF).length}</h4></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Guests</p><h4 className="text-4xl font-black text-slate-900">{users.filter(u => u.role === UserRole.GUEST).length}</h4></div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderTenants = () => {
    const filteredBiz = businesses.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-10 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Business Hub (Tenant Management)</h2>
              <p className="text-slate-400 text-sm font-medium">Global command hub for all authorized business entities and partner nodes.</p>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
           <div className="relative w-full md:w-[400px]">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search node name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50"
              />
           </div>
           <div className="overflow-x-auto rounded-[32px] border border-slate-50">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Node</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Protocol</th>
                       <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Governance Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredBiz.map(biz => (
                       <tr key={biz.id} className="hover:bg-slate-50/30 transition-all group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-5">
                                <img src={biz.images[0]} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-sm" alt={biz.name} />
                                <div>
                                   <p className="font-black text-slate-900 uppercase text-sm">{biz.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase">{biz.category}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                                biz.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>{biz.status}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button onClick={() => setInspectingBizId(biz.id)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><i className="fas fa-eye text-xs"></i></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  };

  const renderSecurity = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[
            { label: 'Security Score', value: '98%', trend: '+0.5%', color: 'text-indigo-600', icon: 'fa-shield-halved' },
            { label: 'Active Incidents', value: incidents.filter(i => i.status === 'investigating').length, trend: 'Investigating', color: 'text-amber-600', icon: 'fa-triangle-exclamation' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          ))}
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">{activeTab.replace('-', ' ')} Hub</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic">Governance Tier: Master Alpha Node</p>
         </div>
      </div>

      <div className="pb-20">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tenants' && renderTenants()}
        {activeTab === 'engine' && renderEngine()}
        {activeTab === 'security' && renderSecurity()}
        
        {/* FALLBACK */}
        {!['overview', 'tenants', 'engine', 'security'].includes(activeTab) && (
           <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center text-3xl mb-8">
                 <i className="fas fa-layer-group"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">{activeTab} Node Online</h3>
              <p className="text-slate-400 font-medium max-w-md">Modul "{activeTab}" sedang aktif. Gunakan terminal tata kelola untuk operasional lanjut.</p>
           </div>
        )}
      </div>
    </div>
  );
};
