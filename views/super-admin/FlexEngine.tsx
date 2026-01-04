
import React, { useState } from 'react';
import { BusinessCategory, SystemModule, SubscriptionPlan, CategoryModuleConfig } from '../../types';

interface FlexEngineProps {
  moduleConfigs: CategoryModuleConfig;
  onUpdateModuleConfigs: (configs: CategoryModuleConfig) => void;
}

export const FlexEngine: React.FC<FlexEngineProps> = ({ moduleConfigs, onUpdateModuleConfigs }) => {
  // Local state for dynamic topologies
  const [topologies, setTopologies] = useState<string[]>(Object.values(BusinessCategory));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTopology, setEditingTopology] = useState<string | null>(null);
  const [newTopologyName, setNewTopologyName] = useState('');

  // Plan Matrix for Feature Authorization (Global Rules)
  const [planMatrix, setPlanMatrix] = useState<Record<SubscriptionPlan, SystemModule[]>>({
    [SubscriptionPlan.BASIC]: [SystemModule.BOOKING, SystemModule.REVIEWS],
    [SubscriptionPlan.PRO]: [SystemModule.BOOKING, SystemModule.REVIEWS, SystemModule.MONTHLY_RENTAL, SystemModule.MARKETING],
    [SubscriptionPlan.PREMIUM]: Object.values(SystemModule)
  });

  const coreModules = [
    { id: SystemModule.BOOKING, label: 'Booking Engine', icon: 'fa-calendar-check', color: 'text-indigo-500' },
    { id: SystemModule.MONTHLY_RENTAL, label: 'Sewa Bulanan', icon: 'fa-calendar-days', color: 'text-emerald-500' },
    { id: SystemModule.SALES_PURCHASE, label: 'Jual-Beli Asset', icon: 'fa-hand-holding-dollar', color: 'text-amber-500' },
    { id: SystemModule.REVIEWS, label: 'Review Hub', icon: 'fa-star', color: 'text-rose-500' }
  ];

  const handleAddTopology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopologyName.trim() || topologies.includes(newTopologyName)) return;
    
    setTopologies([...topologies, newTopologyName]);
    onUpdateModuleConfigs({ ...moduleConfigs, [newTopologyName]: [SystemModule.REVIEWS] });
    setNewTopologyName('');
    setIsAddModalOpen(false);
    alert(`Topology Node "${newTopologyName}" successfully integrated.`);
  };

  const handleEditTopology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopology || !newTopologyName.trim()) return;

    const updatedTopologies = topologies.map(t => t === editingTopology ? newTopologyName : t);
    setTopologies(updatedTopologies);

    const newConfigs = { ...moduleConfigs };
    newConfigs[newTopologyName] = newConfigs[editingTopology];
    delete newConfigs[editingTopology];
    onUpdateModuleConfigs(newConfigs);

    setEditingTopology(null);
    setNewTopologyName('');
    alert(`Topology Node renamed to "${newTopologyName}".`);
  };

  const handleDeleteTopology = (cat: string) => {
    if (confirm(`CRITICAL: Terminate topology "${cat}"? This will disconnect all feature modules for businesses in this category.`)) {
      setTopologies(topologies.filter(t => t !== cat));
      const newConfigs = { ...moduleConfigs };
      delete newConfigs[cat];
      onUpdateModuleConfigs(newConfigs);
    }
  };

  const handleToggleModule = (topology: string, module: SystemModule) => {
    const current = moduleConfigs[topology] || [];
    const updated = current.includes(module) 
      ? current.filter(m => m !== module)
      : [...current, module];
    onUpdateModuleConfigs({ ...moduleConfigs, [topology]: updated });
  };

  const handleTogglePlanModule = (plan: SubscriptionPlan, module: SystemModule) => {
    setPlanMatrix(prev => {
      const current = prev[plan] || [];
      const updated = current.includes(module)
        ? current.filter(m => m !== module)
        : [...current, module];
      return { ...prev, [plan]: updated };
    });
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Platform Feature Governance</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Control business topologies and feature authorization matrix.</p>
        </div>
        <button 
          onClick={() => { setEditingTopology(null); setNewTopologyName(''); setIsAddModalOpen(true); }}
          className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3"
        >
          <i className="fas fa-plus"></i> Inject New Topology
        </button>
      </div>

      {/* 1. TOPOLOGY & MODULE ACTIVATION MATRIX */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <i className="fas fa-microchip text-xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Topology Matrix</h3>
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Platform Core v2.4</div>
        </div>

        <div className="overflow-x-auto rounded-[32px] border border-slate-50">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10">Business Topology</th>
                {coreModules.map(m => (
                  <th key={m.id} className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <i className={`fas ${m.icon} ${m.color} text-sm`}></i>
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{m.label}</span>
                    </div>
                  </th>
                ))}
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Strategic Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topologies.map(cat => (
                <tr key={cat} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-10 py-6 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10">
                    <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{cat}</span>
                  </td>
                  {coreModules.map(m => (
                    <td key={m.id} className="px-6 py-6 text-center">
                      <button 
                        onClick={() => handleToggleModule(cat, m.id)}
                        className={`w-10 h-10 rounded-xl transition-all border-2 flex items-center justify-center mx-auto ${
                          moduleConfigs[cat]?.includes(m.id) 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-white border-slate-100 text-slate-200 hover:text-slate-400'
                        }`}
                      >
                        <i className={`fas ${moduleConfigs[cat]?.includes(m.id) ? 'fa-check' : 'fa-power-off'} text-[10px]`}></i>
                      </button>
                    </td>
                  ))}
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingTopology(cat); setNewTopologyName(cat); setIsAddModalOpen(true); }}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteTopology(cat)}
                        className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"
                      >
                        <i className="fas fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-950 rounded-[40px] text-white flex items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
            <i className="fas fa-shield-halved text-xl"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Global Enforcement</p>
            <p className="text-xs font-medium opacity-60 leading-relaxed max-w-2xl">Disabling a module at the topology level will override any subscription level permissions. The feature will be completely purged from the tenant's interface.</p>
          </div>
        </div>
      </div>

      {/* 2. SUBSCRIPTION PLAN MAPPING GRID */}
      <div className="bg-slate-900 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        
        <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-8">
          <div>
            <h3 className="text-2xl font-black tracking-tighter uppercase">Plan Authorization Hub</h3>
            <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest mt-1">Global access control for feature monetization</p>
          </div>
          <i className="fas fa-gem text-indigo-400 text-3xl"></i>
        </div>

        <div className="relative z-10 overflow-x-auto rounded-[40px] border border-white/5 bg-white/5 backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-[0.2em]">Registry Plan</th>
                {coreModules.map(m => (
                  <th key={m.id} className="px-6 py-8 text-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{m.label}</span>
                  </th>
                ))}
                <th className="px-6 py-8 text-center text-[9px] font-black text-white/40 uppercase tracking-widest">Growth Hub</th>
                <th className="px-6 py-8 text-center text-[9px] font-black text-white/40 uppercase tracking-widest">Financial Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.values(SubscriptionPlan).map(plan => (
                <tr key={plan} className="hover:bg-white/5 transition-colors">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        plan === SubscriptionPlan.PREMIUM ? 'bg-indigo-400 shadow-[0_0_12px_#818cf8]' : 
                        plan === SubscriptionPlan.PRO ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}></div>
                      <span className="font-black text-sm uppercase tracking-tighter">{plan} Node</span>
                    </div>
                  </td>
                  {coreModules.map(m => (
                    <td key={m.id} className="px-6 py-8 text-center">
                      <button 
                        onClick={() => handleTogglePlanModule(plan, m.id)}
                        className={`w-9 h-9 rounded-xl transition-all border-2 flex items-center justify-center mx-auto ${
                          planMatrix[plan]?.includes(m.id)
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/50'
                            : 'bg-white/5 border-white/10 text-white/10 hover:text-white/30'
                        }`}
                      >
                        <i className={`fas ${planMatrix[plan]?.includes(m.id) ? 'fa-check-double' : 'fa-lock'} text-[10px]`}></i>
                      </button>
                    </td>
                  ))}
                  <td className="px-6 py-8 text-center">
                    <button 
                      onClick={() => handleTogglePlanModule(plan, SystemModule.MARKETING)}
                      className={`w-9 h-9 rounded-xl transition-all border-2 flex items-center justify-center mx-auto ${
                        planMatrix[plan]?.includes(SystemModule.MARKETING)
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'bg-white/5 border-white/10 text-white/10'
                      }`}
                    >
                      <i className={`fas ${planMatrix[plan]?.includes(SystemModule.MARKETING) ? 'fa-bolt' : 'fa-lock'} text-[10px]`}></i>
                    </button>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <button 
                      onClick={() => handleTogglePlanModule(plan, SystemModule.PAYMENT)}
                      className={`w-9 h-9 rounded-xl transition-all border-2 flex items-center justify-center mx-auto ${
                        planMatrix[plan]?.includes(SystemModule.PAYMENT)
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white/5 border-white/10 text-white/10'
                      }`}
                    >
                      <i className={`fas ${planMatrix[plan]?.includes(SystemModule.PAYMENT) ? 'fa-vault' : 'fa-lock'} text-[10px]`}></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.4em] pt-4">Secured by SEULANGA OS Deployment Matrix</p>
      </div>

      {/* ADD/EDIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[56px] p-12 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0"></div>
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10 shadow-sm border border-slate-50"><i className="fas fa-times"></i></button>
            
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">
                {editingTopology ? 'Edit Topology' : 'Deploy Topology'}
              </h3>
              <p className="text-slate-400 text-sm font-medium">Configure new business category node in the ecosystem.</p>
            </div>

            <form onSubmit={editingTopology ? handleEditTopology : handleAddTopology} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topology Identity Name</label>
                <input 
                  autoFocus
                  required 
                  value={newTopologyName}
                  onChange={(e) => setNewTopologyName(e.target.value)}
                  placeholder="e.g. Coworking Hub, Parking Node..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner" 
                />
              </div>
              <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
                {editingTopology ? 'Authorize Rename' : 'Authorize Deployment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
