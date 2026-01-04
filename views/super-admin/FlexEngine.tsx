
import React, { useState } from 'react';
import { BusinessCategory, SystemModule, SubscriptionPlan, CategoryModuleConfig } from '../../types';

interface FlexEngineProps {
  moduleConfigs: CategoryModuleConfig;
  onUpdateModuleConfigs: (configs: CategoryModuleConfig) => void;
}

export const FlexEngine: React.FC<FlexEngineProps> = ({ moduleConfigs, onUpdateModuleConfigs }) => {
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(Object.values(BusinessCategory));

  const handleToggleModule = (cat: string, mod: SystemModule) => {
    const current = moduleConfigs[cat] || [];
    const updated = current.includes(mod) ? current.filter(m => m !== mod) : [...current, mod];
    onUpdateModuleConfigs({ ...moduleConfigs, [cat]: updated });
  };

  return (
    <div className="space-y-12 animate-fade-up">
       <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Flex Engine (Platform Logic)</h2>
          <p className="text-slate-400 text-sm font-medium">Orchestrate modular access and subscription mapping.</p>
       </div>

       <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto rounded-[32px] border border-slate-50">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50">Topology Node</th>
                      {[SystemModule.BOOKING, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.MONTHLY_RENTAL, SystemModule.SALES_PURCHASE].map(m => (
                        <th key={m} className="px-6 py-6 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center">{m}</th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {dynamicCategories.map(cat => (
                      <tr key={cat} className="group hover:bg-slate-50/30">
                         <td className="px-8 py-6 sticky left-0 bg-white group-hover:bg-slate-50/30 z-10 font-black text-slate-900 uppercase text-xs">{cat}</td>
                         {[SystemModule.BOOKING, SystemModule.REVIEWS, SystemModule.PAYMENT, SystemModule.MONTHLY_RENTAL, SystemModule.SALES_PURCHASE].map(m => (
                           <td key={m} className="px-6 py-6 text-center">
                              <button 
                                onClick={() => handleToggleModule(cat, m)}
                                className={`w-8 h-8 rounded-xl transition-all border ${moduleConfigs[cat]?.includes(m) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-200 text-slate-200 hover:text-slate-400'}`}
                              >
                                 <i className={`fas ${moduleConfigs[cat]?.includes(m) ? 'fa-check' : 'fa-minus'} text-[10px]`}></i>
                              </button>
                           </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>

       <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <h3 className="text-2xl font-black tracking-tighter uppercase relative z-10">Subscription Plan Matrix</h3>
          <div className="relative z-10 overflow-x-auto rounded-3xl border border-white/5 bg-white/5">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-white/5">
                      <th className="px-10 py-6 text-[10px] font-black text-indigo-300 uppercase tracking-widest">Plan</th>
                      {Object.values(SystemModule).slice(0, 5).map(m => <th key={m} className="px-4 py-6 text-[8px] font-black text-white/40 uppercase text-center">{m}</th>)}
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {Object.values(SubscriptionPlan).map(plan => (
                      <tr key={plan} className="hover:bg-white/5 transition-colors">
                         <td className="px-10 py-6 font-black text-[10px] text-indigo-300 uppercase tracking-widest">{plan} Node</td>
                         {Object.values(SystemModule).slice(0, 5).map(m => (
                           <td key={m} className="px-4 py-6 text-center">
                              <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/20"><i className="fas fa-lock text-[8px]"></i></div>
                           </td>
                         ))}
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};
